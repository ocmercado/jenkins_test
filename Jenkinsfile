#!/usr/bin/env groovy


ACL_BUILD = "feature develop release hotfix master"
ACL_TEST = "feature develop release hotfix master"
ACL_DEPLOY = "develop release hotfix master"

BRANCH_NAME = env.BRANCH_NAME
echo "We are at branch ${BRANCH_NAME}"
echo "Build ACL: ${ACL_BUILD}"
if (ACL_BUILD.contains(BRANCH_NAME)) {
	echo "Building..." 
} else {
	echo "Skipping build. Branch is not in ACL_BUILD.."
}

if (BRANCH_NAME==~ACL_TEST) {
	echo "Testing..." 
} else {
	echo "Skipping test. Branch is not in ACL_TEST.."
}

if (BRANCH_NAME==~ACL_DEPLOY) {
	echo "Deploying..." 
} else {
	echo "Skipping deployment. Branch is not in ACL_DEPLOY.."
}


