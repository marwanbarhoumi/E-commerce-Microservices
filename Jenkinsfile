pipeline {
    agent any

    environment {
        DOCKERHUB_USER  = 'marwen77'
        DOCKERHUB_CREDS = credentials('dockerhub-credentials')
    MARWAN = "BArhoumi"
    }

    stages {

        stage('Checkout') {
            steps {
                echo '📥 Cloning repository...'
                checkout scm
            }
        }

        stage('Build Docker Images') {
            parallel {
                stage('auth-service') {
                    steps {
                        sh 'docker build -t $DOCKERHUB_USER/auth-service:latest ./services/auth-service'
                    }
                }
                stage('product-service') {
                    steps {
                        sh 'docker build -t $DOCKERHUB_USER/product-service:latest ./services/product-service'
                    }
                }
                stage('order-service') {
                    steps {
                        sh 'docker build -t $DOCKERHUB_USER/order-service:latest ./services/order-service'
                    }
                }
                stage('api-gateway') {
                    steps {
                        sh 'docker build -t $DOCKERHUB_USER/api-gateway:latest ./services/api-gateway'
                    }
                }
                stage('frontend') {
                    steps {
                        sh 'docker build -t $DOCKERHUB_USER/frontend:latest ./frontend'
                    }
                }
            }
        }
stage('Debug Login') {
    steps {
        sh '''
            echo "Testing login..."
            echo $DOCKERHUB_TOKEN | docker login -u $DOCKERHUB_USER --password-stdin
            echo "Login result: $?"
            docker info | grep Username
        '''
    }
}
        stage('Push to DockerHub') {
    steps {
        withCredentials([string(credentialsId: 'dockerhub-token', variable: 'TOKEN')]) {
            sh '''
                echo $TOKEN | docker login -u marwen77 --password-stdin
                docker push marwen77/auth-service:latest
                docker push marwen77/product-service:latest
                docker push marwen77/order-service:latest
                docker push marwen77/api-gateway:latest
                docker push marwen77/frontend:latest
            '''
        }
    }
}

        stage('Deploy to Kubernetes') {
            steps {
                echo '☸️ Deploying to Minikube...'
                sh 'kubectl apply -f k8s/mongo-secret.yaml'
                sh 'kubectl apply -f k8s/auth-service.yaml'
                sh 'kubectl apply -f k8s/product-service.yaml'
                sh 'kubectl apply -f k8s/order-service.yaml'
                sh 'kubectl apply -f k8s/api-gateway.yaml'
                sh 'kubectl apply -f k8s/frontend.yaml'
                sh 'kubectl rollout restart deployment/auth-service'
                sh 'kubectl rollout restart deployment/product-service'
                sh 'kubectl rollout restart deployment/order-service'
                sh 'kubectl rollout restart deployment/api-gateway'
                sh 'kubectl rollout restart deployment/frontend'
            }
        }

        stage('Verify') {
            steps {
                echo '✅ Checking deployments...'
                sh 'kubectl get pods'
                sh 'kubectl get services'
            }
        }
    }

    post {
        success {
            echo '🎉 Pipeline réussi — tout est déployé!'
        }
        failure {
            echo '❌ Pipeline échoué — vérifier les logs'
        }
    }
}