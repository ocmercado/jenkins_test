#!/usr/bin/env groovy

// Pipeline stage ACL. Define here which branch types will be executed at each stage

def ACL_BUILD = "feature develop release hotfix master"
def ACL_TEST = "feature develop release hotfix master"
def ACL_DEPLOY = "develop release hotfix master"

//
// Node selection logic here

def NODE_LABEL="master"

// End: Node selection logic


def BRANCH_NAME = toLowerCase(env.BRANCH_NAME)

def BRANCH_TYPE = BRANCH_NAME.contains("feature") ? "feature" : BRANCH_NAME
BRANCH_TYPE = BRANCH_NAME.contains("release") ? "release" : BRANCH_NAME
BRANCH_TYPE = BRANCH_NAME.contains("hotfix") ? "hotfix" : BRANCH_NAME

echo "Branch name:  ${BRANCH_NAME}"
echo "Branch type: ${BRANCH_TYPE}"
echo "Starting pipeline for branch ${BRANCH_NAME} on node ${NODE_LABEL}"


node(NODE_LABEL) {

  // Start: Stage CHECKOUT and BUILD
  if (ACL_BUILD.contains(BRANCH_TYPE)) {
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
 // End: Stage CHECKOUT and BUILD

 // Start: Stage DEPLOY
 if (ACL_DEPLOY.contains(BRANCH_TYPE)){
        try {
                stage('DEPLOY') {
                        echo "Deploying..."
                }

        } catch(err) {
                abortPipeline(err)
        }

  } else {
        echo "Skipping Deploy stage. Branch is not in ACL_DEPLOY"
  }     	
}

