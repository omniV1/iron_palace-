# Iron Palace Podcast

A single-page application for the Iron Palace Podcast — "The World's Most Anabolic Podcast."

Built with **Spring Boot 3.4** (Java 17) and served as a self-contained JAR.

## Prerequisites

- Java 17+
- Maven 3.8+

## Build

```bash
mvn clean package
```

This produces `target/iron-palace-podcast-1.0.0.jar`.

## Run Locally

```bash
java -jar target/iron-palace-podcast-1.0.0.jar
```

Open [http://localhost:8080](http://localhost:8080).

To use a custom port:

```bash
java -jar target/iron-palace-podcast-1.0.0.jar --server.port=3000
```

## AWS Deployment (Cost-Effective Options)

### Option 1: AWS Elastic Beanstalk (Simplest)

Best for: always-on hosting with minimal config. Free-tier eligible (t3.micro for 12 months).

1. Install the [EB CLI](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/eb-cli3.html)
2. Initialize and deploy:

```bash
mvn clean package
eb init iron-palace --platform "Corretto 17" --region us-east-1
eb create iron-palace-prod --single --instance-type t3.micro
eb deploy
```

Estimated cost: **~$0/mo** (free tier) or **~$8/mo** after free tier.

### Option 2: AWS App Runner (Auto-Scaling, Zero Ops)

Best for: hands-off deployment that scales to zero.

1. Build the Docker image:

```bash
mvn clean package
docker build -t iron-palace .
```

2. Push to ECR and deploy via App Runner console or CLI.

Estimated cost: **~$5-15/mo** depending on traffic (auto-pauses when idle).

### Option 3: AWS Lambda + Function URL (Cheapest for Low Traffic)

Best for: podcast sites with sporadic traffic — pay only per request.

1. Add the `aws-serverless-java-container` dependency
2. Create a Lambda handler wrapping the Spring Boot app
3. Deploy with SAM or CDK

Estimated cost: **~$0-2/mo** for typical podcast site traffic.

### Option 4: EC2 Direct (Full Control)

```bash
scp target/iron-palace-podcast-1.0.0.jar ec2-user@<ip>:~/
ssh ec2-user@<ip>
nohup java -jar iron-palace-podcast-1.0.0.jar --server.port=80 &
```

Estimated cost: **~$8/mo** (t3.micro).

## Project Structure

```
iron_palace-/
├── pom.xml
├── Dockerfile
├── README.md
└── src/main/
    ├── java/com/ironpalace/
    │   └── IronPalaceApplication.java
    └── resources/
        ├── application.properties
        └── static/
            ├── index.html
            ├── css/styles.css
            ├── js/app.js
            └── images/
```
