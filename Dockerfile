# STAGE 1 - build the react app
# set the base image to build from
# This is the application image from which all other subsequent
# applications run. Alpine Linux is a security-oriented, lightweight #(~5Mb) Linux distribution.
FROM node:18.18.0 as build
# set working directory
# this is the working folder in the container from which the app.   # will be running from
WORKDIR /app
# add the node_modules folder to $PATH
ENV PATH /app/node_modules/.bin:$PATH
# copy package.json file to /app directory for installation prep
COPY ./package.json /app/
COPY ./yarn.lock /app/
#https
ENV export HTTPS=true

# install dependencies
RUN yarn
# copy everything to /app directory
COPY . /app
# build the app
RUN yarn build
# STAGE 2 - build the final image using a nginx web server
# distribution and copy the react build files
FROM nginx:alpine
COPY --from=build /app/build /var/www/
# needed this to make React Router work properly
COPY nginx/nginx.conf /etc/nginx/nginx.conf
# Expose port 80 for HTTP Traffic
EXPOSE 82
# start the nginx web server
ENTRYPOINT ["nginx", "-g", "daemon off;"]
