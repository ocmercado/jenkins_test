#!/usr/bin/env groovy


ACL_BUILD = "feature develop release hotfix"
ACL_TEST = "feature develop release hotfix master"
ACL_DEPLOY = "develop release hotfix master"

BRANCH_NAME = env.BRANCH_NAME
echo "Starting pipeline for branch ${BRANCH_NAME}"

node {
  if (ACL_BUILD.contains(BRANCH_NAME)) {
	try {
		stage('CHECKOUT') {
			checkout scm
		}
	} catch(err) {
		abortPipeline(err)
	}

	try {
		stage('BUILD') {
			sh("rm -rf dist/ConfigFileHandler.zip");
			sh("zip -r dist/ConfigFileHandler *");
		}

	} catch(err) {
		abortPipeline(err)
	}
  } else {
	echo "Skipping Build. Branch is not in ACL_BUILD"
    	currentBuild.result = 'ABORTED'
    	return
  }
}


