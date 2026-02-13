pipeline {
    agent any

    triggers {
        githubPush()
    }

    environment {
        // [Code Repo]
        CRED_ID_FE = 'github-fe-key' 

        // [Manifest Repo] - New Repository (Separate Credential)
        CRED_ID_MANIFEST = 'github-manifest-key' 
        MANIFEST_REPO_URL = 'git@github.com:20250918-beyond-SW-Camp-21th/beyond-SW-21th-Final-4team-Manifest-file.git'
        
        // Docker
        IMAGE_NAME = 'o2ppo/freebrfront001'
        DOCKER_CRED_ID = 'dockerhub-credentials'
        
        // Git Config
        GIT_EMAIL = 'lmjayoul@gmail.com'
    }

    stages {
        stage('Checkout Code') {
            steps {
                cleanWs() 
                checkout scm
                echo "Source Code Checkout Complete"
            }
        }

        stage('Setup & Check') {
            steps {
                script {
                    env.GIT_COMMIT_HASH = sh(script: "git rev-parse --short HEAD", returnStdout: true).trim()
                    env.IMAGE_TAG = "${currentBuild.number}-${env.GIT_COMMIT_HASH}"
                    
                    def rawBranch = env.BRANCH_NAME ?: (env.GIT_BRANCH ?: 'main')
                    env.TARGET_BRANCH = rawBranch.replace('origin/', '')
                    
                    echo " Build Tag: ${env.IMAGE_TAG}"
                    echo " Target Branch: ${env.TARGET_BRANCH}"
                }
            }
        }

        stage('Build & Push') {
            steps {
                script {
                    withCredentials([usernamePassword(credentialsId: "${env.DOCKER_CRED_ID}", usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                        sh "docker build -t ${env.IMAGE_NAME}:${env.IMAGE_TAG} ."
                        sh 'echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin'
                        sh "docker push ${env.IMAGE_NAME}:${env.IMAGE_TAG}"
                        sh "docker tag ${env.IMAGE_NAME}:${env.IMAGE_TAG} ${env.IMAGE_NAME}:latest"
                        sh "docker push ${env.IMAGE_NAME}:latest"
                    }
                }
            }
        }

        stage('Update Manifest Repo') {
            steps {
                script {
                    sshagent(credentials: ["${env.CRED_ID_MANIFEST}"]) {
                        sh """
                            # 1. Setup SSH
                            mkdir -p ~/.ssh && ssh-keyscan github.com >> ~/.ssh/known_hosts

                            # 2. Clone Manifest Repository
                            # Removing existing dir if any
                            rm -rf manifest-repo
                            git clone ${env.MANIFEST_REPO_URL} manifest-repo
                            
                            cd manifest-repo

                            # Configure Git
                            git config user.name "Jenkins Frontend Bot"
                            git config user.email "${env.GIT_EMAIL}"
                            
                            # 3. Check for Manifest Files
                            if [ ! -f kube-folder/frontend-deployment.yml ]; then
                                echo "Error: kube-folder/frontend-deployment.yml not found in manifest repo!"
                                echo "Current directory structure:"
                                ls -R
                                exit 1
                            fi

                            # 4. Update Image Tag
                            echo "Updating kube-folder/frontend-deployment.yml..."
                            sed -i 's|image: ${env.IMAGE_NAME}:.*|image: ${env.IMAGE_NAME}:${env.IMAGE_TAG}|g' kube-folder/frontend-deployment.yml
                            
                            # Verify change
                            cat kube-folder/frontend-deployment.yml | grep "image:"
                                
                                # 5. Commit & Push
                                git add .
                                if ! git diff --cached --quiet; then
                                    git commit -m "[Jenkins] Update image to ${env.IMAGE_TAG}"
                                    git push origin main
                                    echo "Manifest Repo Updated!"
                                else
                                    echo "No changes to push."
                                fi
                        """
                    }
                }
            }
        }

        stage('Deploy to Server Eric pc') {
            steps {
                script {
                    withCredentials([file(credentialsId: 'k8s-kubeconfig', variable: 'KUBECONFIG')]) {
                        sh '''
                            export KUBECONFIG=$KUBECONFIG
                            chmod 600 $KUBECONFIG
                            
                            # Fix Kubeconfig server URL (typo and incorrect IP)
                            # 1. Correct the specific IP including protocol fix if malformed
                            sed -i 's|https:/192.168.0.28|https://192.168.0.12|g' $KUBECONFIG
                            
                            # 2. Generic fix for https:/ -> https:// but prevent https:/// (match only if not followed by /)
                            sed -i 's|https:/\\([^/]\\)|https://\\1|g' $KUBECONFIG
                            
                            # Ensure kubectl is installed (Simplified check)
                            if ! command -v kubectl > /dev/null 2>&1; then
                                echo "Installing kubectl..."
                                curl -LO "https://dl.k8s.io/release/v1.31.0/bin/linux/amd64/kubectl"
                                chmod +x kubectl
                                
                                # Try installing to global path, fall back to user local bin
                                if mv kubectl /usr/local/bin/ > /dev/null 2>&1; then
                                    echo "Installed kubectl to /usr/local/bin"
                                else
                                    echo "Cannot install to /usr/local/bin. Installing to $HOME/bin"
                                    mkdir -p $HOME/bin
                                    mv kubectl $HOME/bin/ || exit 1
                                    export PATH=$HOME/bin:$PATH
                                fi
                            fi
                            
                            echo "Deploying to Server B..."
                            kubectl cluster-info
                            
                            # Apply from the CLONED manifest-repo directory
                            cd manifest-repo
                            
                            # Apply all manifests
                            kubectl apply -f kube-folder/frontend-deployment.yml
                            kubectl apply -f kube-folder/frontend-service.yml
                            # kubectl apply -f kube-folder/frontend-ingress.yml || true
                            
                            # Restart rollout to ensure image pull
                            kubectl rollout restart deployment/frontend
                            
                            echo "Deployment Command Sent!"
                        '''
                    }
                }
            }
        }
    }
    
    post {
        always {
            sh 'docker logout || true'
            cleanWs()
        }
        success {
            withCredentials([string(credentialsId: 'discord', variable: 'DISCORD')]) {
                discordSend(
                    description: """
                        **배포 성공!** :tada:
                        
                        **Tag**: ${env.IMAGE_TAG}
                        **Repo**: [Manifest Repo Link](${env.MANIFEST_REPO_URL})
                        **Result**: SUCCESS
                    """.stripIndent(),
                    result: 'SUCCESS',
                    title: "${env.JOB_NAME} Build Success", 
                    webhookURL: "$DISCORD"
                )
            }
        }
        failure {
            withCredentials([string(credentialsId: 'discord', variable: 'DISCORD')]) {
                discordSend(
                    description: "**배포 실패** :x: Check Console Output",
                    result: 'FAILURE',
                    title: "${env.JOB_NAME} Build Failed", 
                    webhookURL: "$DISCORD"
                )
            }
        }
    }
}
