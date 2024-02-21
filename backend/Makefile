BRANCH?=$(shell git rev-parse --abbrev-ref HEAD | sed -e 's/develop/testnet/g;s/stage/stagenet/g;s/prod/mainnet/g')
GITREF=$(shell git rev-parse --short HEAD)
BUILDTAG?=$(shell git rev-parse --abbrev-ref HEAD | sed -e 's/prod/mainnet/g;s/develop/testnet/g;s/testnet-multichain/testnet/g;s/stage/stagenet/g')
# pull branch name from CI, if available
ifdef CI_COMMIT_BRANCH
	BRANCH=$(shell echo ${CI_COMMIT_BRANCH} | sed 's/master/mocknet/g')
	BUILDTAG=$(shell echo ${CI_COMMIT_BRANCH} | sed -e 's/master/mocknet/g;s/develop/mocknet/g;s/testnet-multichain/testnet/g;s/stage/stagenet/g')
endif
VERSION=$(shell bash get_next_git_tag.sh ${INCREMENT_TYPE})
CI_PAT=$(shell echo ${CR_PAT})


# ------------------------------- GitLab ------------------------------- #
git-pull: ## Git pull repository
	@git clean -idf
	@git pull origin $(shell git rev-parse --abbrev-ref HEAD)

docker-login:
	docker login -u ${CI_REGISTRY_USER} -p ${CR_PAT} ${CI_REGISTRY}

url-check:
	@if [ -z "${GCR}" ]; then\
		echo "add gcr env variable";\
		exit 1;\
    fi

docker-push:
	docker push ${GCR}/${IMAGENAME}:${GITREF}_${VERSION}

docker-build:
	docker build -f Dockerfile --build-arg build_command="build:${TAG}" -t ${GCR}/${IMAGENAME}:${GITREF}_${VERSION} .

push-tag:
	bash ./push_tag.sh ${VERSION}

release: docker-build docker-push push-tag

push-only-image: docker-build docker-push

# ------------------------------------------------------------------ #
