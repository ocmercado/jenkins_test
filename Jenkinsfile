#!/usr/bin/env groovy


ACL_BUILD = "feature develop release hotfix master"
ACL_TEST = "feature develop release hotfix master"
ACL_DEPLOY = "develop release hotfix master"

BRANCH_NAME = env.BRANCH_NAME
echo "We are at branch ${BRANCH_NAME}"
echo "Build ACL: ${ACL_BUILD}"

node {
	try {
		if (ACL_BUILD.contains(BRANCH_NAME)) {
			checkout scm
			echo "Building"
		} else {
			echo "Skipping Build. Branch is not in ACL_BUILD"
		}
	} catch(err) {
		abortPipeline(err)
	}
}

