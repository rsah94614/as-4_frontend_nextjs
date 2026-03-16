pipeline {
    agent any
    
    tools {
        nodejs 'nodejs' 
    }

    environment {
        // --- Branch Control & Images ---
        TARGET_BRANCH = "pipeline-branch"
        REPO_URL = "https://github.com/rsah94614/as-4_frontend_nextjs.git" 
        IMAGE = "mrmonster786/employee-rr-frontend"
        TAG = "${TARGET_BRANCH}-${env.BUILD_NUMBER}"
        CONTAINER_NAME = "frontend-${TARGET_BRANCH}"
        DOCKER_BUILDKIT = "1"
        
        // --- Target Infrastructure ---
        TARGET_EC2_HOST = "aabhar.top"
        HOST_PORT = "3000"

        // --- Frontend API Routing Variables ---
        NEXT_PUBLIC_API_URL = "https://backend.aabhar.top"
        NEXT_PUBLIC_RECOGNITION_API_URL = "https://backend.aabhar.top"
        NEXT_PUBLIC_EMPLOYEE_API_URL = "https://backend.aabhar.top"
        NEXT_PUBLIC_WALLET_API_URL = "https://backend.aabhar.top"
        NEXT_PUBLIC_REWARDS_API_URL = "https://backend.aabhar.top"
        NEXT_PUBLIC_ANALYTICS_API_URL = "https://backend.aabhar.top"
        NEXT_PUBLIC_ORG_API_URL = "https://backend.aabhar.top"
        NEXT_PUBLIC_ROLES_API_URL = "https://backend.aabhar.top"
    }

    options {
        buildDiscarder(logRotator(numToKeepStr: '10'))
        disableConcurrentBuilds()
        timestamps()
    }

    stages {
        stage('Checkout Source') {
            steps {
                echo "Fetching code for branch: ${TARGET_BRANCH} using GitHub PAT..."
                // Added credentialsId here to authenticate with GitHub
                git branch: "${TARGET_BRANCH}", credentialsId: 'github-frontend-creds', url: "${REPO_URL}"
            }
        }

        // 1. Parallelize Static Scans (NPM Install + Lint + Trivy FS + Gitleaks)
        stage('Static Analysis & Security') {
            parallel {
                stage('Secrets Scan (Gitleaks)') {
                    steps {
                        sh 'gitleaks detect --source . --report-format json --report-path gitleaks-report.json --exit-code 0 || true'
                    }
                }

                stage('Dependencies & Quality') {
                    steps {
                        sh 'npm ci'
                        sh 'npm run lint || true' 
                    }
                }

                stage('SCA - Trivy Filesystem') {
                    steps {
                        sh 'trivy fs --severity CRITICAL --ignore-unfixed --format json --output trivy-fs-report.json . || true'
                    }
                }
            }
        }

        // 2. Build Stage (Injects Environment Variables)
        stage('Build Docker Image') {
            steps {
                echo 'Building Next.js Production Image...'
                sh """
                docker build \\
                  --build-arg NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL} \\
                  --build-arg NEXT_PUBLIC_RECOGNITION_API_URL=${NEXT_PUBLIC_RECOGNITION_API_URL} \\
                  --build-arg NEXT_PUBLIC_EMPLOYEE_API_URL=${NEXT_PUBLIC_EMPLOYEE_API_URL} \\
                  --build-arg NEXT_PUBLIC_WALLET_API_URL=${NEXT_PUBLIC_WALLET_API_URL} \\
                  --build-arg NEXT_PUBLIC_REWARDS_API_URL=${NEXT_PUBLIC_REWARDS_API_URL} \\
                  --build-arg NEXT_PUBLIC_ANALYTICS_API_URL=${NEXT_PUBLIC_ANALYTICS_API_URL} \\
                  --build-arg NEXT_PUBLIC_ORG_API_URL=${NEXT_PUBLIC_ORG_API_URL} \\
                  --build-arg NEXT_PUBLIC_ROLES_API_URL=${NEXT_PUBLIC_ROLES_API_URL} \\
                  -t ${IMAGE}:${TAG} .
                """
            }
        }

        // 3. Container Scan
        stage('Dynamic Analysis') {
            steps {
                sh 'trivy image --scanners vuln --severity HIGH,CRITICAL --format json --output trivy-image-report.json ${IMAGE}:${TAG} || true'
            }
        }

        // 4. Push Image
        stage('Push Image') {
            when { branch 'pipeline-branch' }
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    sh '''
                    echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin
                    docker push $IMAGE:$TAG
                    docker tag $IMAGE:$TAG $IMAGE:latest
                    docker push $IMAGE:latest
                    '''
                }
            }
        }

        // 5. Deploy to Frontend EC2 & Verify Health
        stage('Deploy to EC2 (AWS)') {
            when { branch 'pipeline-branch' }
            steps {
                script {
                    sshagent(credentials: ['frontend-ec2-ssh-key']) {
                        sh """
                        ssh -o StrictHostKeyChecking=no ubuntu@${TARGET_EC2_HOST} "
                            docker stop ${CONTAINER_NAME} || true
                            docker rm ${CONTAINER_NAME} || true
                            
                            docker pull ${IMAGE}:${TAG}
                            
                            docker run -d \\
                            --name ${CONTAINER_NAME} \\
                            --restart always \\
                            -p ${HOST_PORT}:3000 \\
                            ${IMAGE}:${TAG}
                            
                            echo '🧹 Running cleanup...'
                            docker system prune -f
                            docker image prune -af --filter 'until=24h'
                        "
                        """
                    }

                    echo "🚀 Application deployed successfully. Traffic handled by Nginx." 
                    echo "⏳ Waiting for Next.js SSR to boot..."
                    
                    timeout(time: 3, unit: 'MINUTES') { 
                        waitUntil {
                            script {
                                def r = sh(script: "curl -sL -o /dev/null -w '%{http_code}' https://${TARGET_EC2_HOST}/ || true", returnStdout: true).trim()
                                if (r == "200" || r == "308") {
                                    echo "Frontend is reachable! HTTP Code: ${r}"
                                    return true
                                } else {
                                    echo "Still waiting for Frontend... HTTP Code: ${r}"
                                    return false
                                }
                            }
                        }
                    }
                    echo "✅ Next.js Frontend is fully booted and responding!"
                }
            }
        }
    }

    post {
        always {
            archiveArtifacts artifacts: '**/*.json', allowEmptyArchive: true
            
            echo "Running deep cleanup to free up Jenkins disk space..."
            cleanWs()
            sh "docker image prune -f"
            sh "docker builder prune -f"
        }
        success {
            withCredentials([
                string(credentialsId: 'rr-backend-slack-bot-token', variable: 'SLACK_TOKEN'),
                string(credentialsId: 'rr-backend-slack-default-channel-id', variable: 'SLACK_CHANNEL')
            ]) {
                sh '''
                curl -s -X POST https://slack.com/api/chat.postMessage \\
                -H "Authorization: Bearer $SLACK_TOKEN" \\
                -H "Content-type: application/json" \\
                -d @- <<EOF
                {
                    "channel": "$SLACK_CHANNEL",
                    "text": "✅ *Success*: Build #$BUILD_NUMBER of frontend deployed to AWS successfully.\\n🔍 <$BUILD_URL|View Jenkins Logs> | 🌍 <https://$TARGET_EC2_HOST|View Live Site>"
                }
EOF
                '''
            }
        }
        failure {
            withCredentials([
                string(credentialsId: 'rr-backend-slack-bot-token', variable: 'SLACK_TOKEN'),
                string(credentialsId: 'rr-backend-slack-default-channel-id', variable: 'SLACK_CHANNEL')
            ]) {
                sh '''
                curl -s -X POST https://slack.com/api/chat.postMessage \\
                -H "Authorization: Bearer $SLACK_TOKEN" \\
                -H "Content-type: application/json" \\
                -d @- <<EOF
                {
                    "channel": "$SLACK_CHANNEL",
                    "text": "❌ *Failure*: Build #$BUILD_NUMBER of frontend failed.\\n🔍 <$BUILD_URL|Check Jenkins Logs immediately>"
                }
EOF
                '''
            }
        }
    }
}