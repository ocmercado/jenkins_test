#!/usr/bin/env groovy


DO_BUILD = "feature develop release hotfix master"
DO_TEST = "feature develop release hotfix master"
DO_DEPLOY = "develop release hotfix master"

BRANCH_NAME = env.BRANCH_NAME
echo "We are at branch ${BRANCH_NAME}"
echo "Build ACL: ${DO_BUILD}"
if (BRANCH_NAME==~DO_BUILD) {
	echo "Building..." 
} else {
	echo "Skipping build..."
}

if (BRANCH_NAME==~DO_TEST) {
	echo "Testing..." 
} else {
	echo "Skipping test..."
}

if (BRANCH_NAME==~DO_DEPLOY) {
	echo "Deploying..." 
} else {
	echo "Skipping deployment..."
}


