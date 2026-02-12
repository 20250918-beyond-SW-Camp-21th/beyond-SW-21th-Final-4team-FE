pipeline {
    agent any

    // 깃허브 웹훅 신호를 받으면 자동으로 빌드를 실행하라는 설정
    triggers {
        githubPush()
    }

    environment {
        // 프론트엔드 레포지토리 주소 & 키 ID (단일 레포지토리이므로 하나만 사용)
        // FE_REPO_URL은 checkout scm에서 자동으로 가져오므로 생략 가능하나 명시적으로 사용해도 됨
        CRED_ID_FE = 'github-fe-key' // 프론트엔드용 SSH 키 ID (쓰기 권한 필요)

        // 이미지 정보
        IMAGE_NAME = 'o2ppo/freebrfront001'
        DOCKER_CRED_ID = 'dockerhub-credentials'
        
        // Git 설정
        GIT_EMAIL = 'lmjayoul@gmail.com'
        
        // script 블록 안에서 실행해야 하므로 초기값은 빈 문자열로 두고 stage에서 설정
    }

    stages {
        // 1. 코드 다운로드 (Checkout)
        // Jenkins Pipeline의 기본 checkout scm 동작 또는 명시적 checkout 사용
        stage('Checkout Code') {
            steps {
                // 이전 빌드 아티팩트 정리
                cleanWs() 
                
                // 현재 설정된 SCM(Git)에서 코드 가져오기
                checkout scm
                
                echo "소스코드 다운로드 완료"
            }
        }

        // 2. 환경 변수 설정 및 연결 확인
        stage('Setup & Check') {
            steps {
                script {
                    // Git Commit Hash 추출 (Short)
                    env.GIT_COMMIT_HASH = sh(script: "git rev-parse --short HEAD", returnStdout: true).trim()
                    env.IMAGE_TAG = "${currentBuild.number}-${env.GIT_COMMIT_HASH}"
                    
                    // [New] 브랜치 이름 동적 감지 (origin/dev -> dev)
                    // Multibranch Pipeline(BRANCH_NAME) 또는 일반 Pipeline(GIT_BRANCH) 대응
                    def rawBranch = env.BRANCH_NAME ?: (env.GIT_BRANCH ?: 'main')
                    env.TARGET_BRANCH = rawBranch.replace('origin/', '')
                    
                    echo " 빌드 정보 확인: ${env.IMAGE_TAG}"
                    echo " 타겟 브랜치: ${env.TARGET_BRANCH}"
                }
            }
        }

        // 3. 도커 빌드 & 푸시
        stage('Build & Push') {
            steps {
                script {
                    echo " [프론트엔드] 빌드 시작 (태그: ${env.IMAGE_TAG})"
                    
                    // 디렉토리 구조상 Dockerfile은 루트에 있다고 가정
                    withCredentials([usernamePassword(credentialsId: "${env.DOCKER_CRED_ID}", usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                        // 캐시 활용을 위해 --cache-from 사용 권장 (이전 빌드 이미지가 있다면)
                        sh "docker build -t ${env.IMAGE_NAME}:${env.IMAGE_TAG} ."
                        sh "echo ${DOCKER_PASS} | docker login -u ${DOCKER_USER} --password-stdin"
                        sh "docker push ${env.IMAGE_NAME}:${env.IMAGE_TAG}"
                        
                        // latest 태그도 업데이트 (선택사항)
                        sh "docker tag ${env.IMAGE_NAME}:${env.IMAGE_TAG} ${env.IMAGE_NAME}:latest"
                        sh "docker push ${env.IMAGE_NAME}:latest"
                    }
                }
            }
        }

        // 4. Manifest 업데이트 (같은 레포지토리)
        stage('Update Manifest') {
            steps {
                script {
                    sshagent(credentials: ["${env.CRED_ID_FE}"]) {
                        sh """
                            git config user.name "Jenkins Frontend Bot"
                            git config user.email "${env.GIT_EMAIL}"
                            mkdir -p ~/.ssh && ssh-keyscan github.com >> ~/.ssh/known_hosts

                            # 최신 상태 가져오기 (충돌 방지)
                            git pull origin ${env.TARGET_BRANCH} --rebase

                            # 타겟 파일: kube-folder/frontend-deployment.yml
                            if [ -f kube-folder/frontend-deployment.yml ]; then
                                echo " Manifest 파일 수정 중..."
                                
                                # sed를 사용하여 이미지 태그 업데이트
                                # Linux 환경에서는 -i 뒤에 빈 문자열 '' 없이 사용 가능하지만, 
                                # 일부 환경(macOS 등) 호환성을 위해 주의 필요. Jenkins(Linux)는 보통 바로 사용.
                                sed -i 's|image: ${env.IMAGE_NAME}:.*|image: ${env.IMAGE_NAME}:${env.IMAGE_TAG}|g' kube-folder/frontend-deployment.yml
                                
                                # 변경사항 확인
                                cat kube-folder/frontend-deployment.yml | grep "image:"
                                
                                git add kube-folder/frontend-deployment.yml
                                
                                if ! git diff --cached --quiet; then
                                    # [skip ci]를 메시지에 포함하여 무한 빌드 루프 방지
                                    git commit -m "[Frontend] Update image tag to ${env.IMAGE_TAG} [skip ci]"
                                    git push origin ${env.TARGET_BRANCH}
                                    echo "Manifest 업데이트 및 푸시 완료!"
                                else
                                    echo "변경사항 없음 (Skipping push)."
                                fi
                            else
                                echo "kube-folder/frontend-deployment.yml 파일을 찾을 수 없습니다."
                                exit 1
                            fi
                        """
                    }
                }
            }
        }

        // 5. 원격 배포 (Server B) - Eric PC
        stage('Deploy to Server B') {
            steps {
                script {
                    withCredentials([file(credentialsId: 'k8s-kubeconfig', variable: 'KUBECONFIG')]) {
                        sh '''
                            export KUBECONFIG=$KUBECONFIG
                            
                            # kubectl 존재 확인 및 설치 (보안 강화)
                            if command -v kubectl > /dev/null 2>&1; then
                                echo "Using pre-installed kubectl"
                            else
                                KUBECTL_VER="v1.31.0"
                                echo "kubectl not found. Downloading version ${KUBECTL_VER}..."
                                
                                # Binary 다운로드
                                curl -LO "https://dl.k8s.io/release/${KUBECTL_VER}/bin/linux/amd64/kubectl"
                                if [ ! -s kubectl ]; then
                                    echo "Error: Verified download failed (empty or missing file)."
                                    exit 1
                                fi

                                # Checksum 다운로드
                                curl -LO "https://dl.k8s.io/release/${KUBECTL_VER}/bin/linux/amd64/kubectl.sha256"
                                
                                # Checksum 검증
                                echo "$(cat kubectl.sha256)  kubectl" | sha256sum --check
                                if [ $? -ne 0 ]; then
                                    echo "Error: Checksum verification failed!"
                                    exit 1
                                fi
                                
                                chmod +x kubectl
                                mkdir -p $HOME/bin
                                mv kubectl $HOME/bin/
                                export PATH=$HOME/bin:$PATH
                            fi
                            
                            echo "Server B로 배포 시작 (Using kubeconfig: $KUBECONFIG)..."
                            
                            # 권한 조정 (Jenkins 임시 파일 문제 방지)
                            chmod 600 $KUBECONFIG
                            
                            # 클러스터 연결 확인
                            kubectl cluster-info
                            
                            # 배포 적용
                            kubectl apply -f kube-folder/frontend-deployment.yml
                            kubectl apply -f kube-folder/frontend-service.yml
                            
                            # 롤아웃 재시작 (이미지 갱신 강제)
                            kubectl rollout restart deployment/frontend
                            
                            echo "배포 명령 전송 완료!"
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
                        **빌드 성공!** :tada:
                        
                        **제목**: ${currentBuild.displayName}
                        **결과**: :white_check_mark: ${currentBuild.currentResult}
                        **실행 시간**: ${currentBuild.duration / 1000}s
                        **링크**: [빌드 결과 보기](${env.BUILD_URL})
                    """.stripIndent(),
                    result: 'SUCCESS',
                    title: "${env.JOB_NAME} 빌드 성공!", 
                    webhookURL: "$DISCORD"
                )
            }
        }
        failure {
            withCredentials([string(credentialsId: 'discord', variable: 'DISCORD')]) {
                discordSend(
                    description: """
                        **빌드 실패!** :x:
                        
                        **제목**: ${currentBuild.displayName}
                        **결과**: :x: ${currentBuild.currentResult}
                        **실행 시간**: ${currentBuild.duration / 1000}s
                        **링크**: [빌드 결과 보기](${env.BUILD_URL})
                    """.stripIndent(),
                    result: 'FAILURE',
                    title: "${env.JOB_NAME} 빌드 실패!", 
                    webhookURL: "$DISCORD"
                )
            }
        }
    }
}
