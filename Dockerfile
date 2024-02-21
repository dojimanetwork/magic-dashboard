FROM node:18 AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* ./
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi


# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
ARG build_command
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN ls -lasrt
# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
ENV NEXT_TELEMETRY_DISABLED 1

RUN NODE_OPTIONS="--max_old_space_size=8192" yarn $build_command

# If using npm comment out above and use below instead
# RUN npm run build

# Production image, copy all the files and run next
FROM nginx:alpine
WORKDIR /app

ENV NODE_ENV production

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder  /app/build /var/www/
COPY nginx/nginx.conf /etc/nginx/nginx.conf

EXPOSE 3006

# start the nginx web server
ENTRYPOINT ["nginx", "-g", "daemon off;"]


# # STAGE 1 - build the react app
# # set the base image to build from
# # This is the application image from which all other subsequent
# # applications run. Alpine Linux is a security-oriented, lightweight #(~5Mb) Linux distribution.
# FROM node:18.18.0 as build
# # set working directory
# # this is the working folder in the container from which the app.   # will be running from
# WORKDIR /app
# # add the node_modules folder to $PATH
# ENV PATH /app/node_modules/.bin:$PATH
# # copy package.json file to /app directory for installation prep
# COPY ./package.json /app/
# COPY ./yarn.lock /app/
# #https
# ENV export HTTPS=true

# # install dependencies
# RUN yarn
# # copy everything to /app directory
# COPY . /app
# # build the app
# RUN yarn build
# # STAGE 2 - build the final image using a nginx web server
# # distribution and copy the react build files
# FROM nginx:alpine
# COPY --from=build /app/build /var/www/
# # needed this to make React Router work properly
# COPY nginx/nginx.conf /etc/nginx/nginx.conf
# # Expose port 80 for HTTP Traffic
# EXPOSE 82
# # start the nginx web server
# ENTRYPOINT ["nginx", "-g", "daemon off;"]
