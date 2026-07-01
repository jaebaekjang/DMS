# ===== DM'S 랜딩 (Spring Boot) — JVM 호스팅용 Docker 이미지 =====
# Render / Railway / Fly.io / Cloud Run 어디서나 동일하게 빌드·실행됩니다.

# 1) 빌드 단계
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
# 의존성 사전 캐싱(best-effort) — 실패해도 다음 package 단계에서 받습니다.
RUN mvn -q -B dependency:go-offline || true
COPY src ./src
RUN mvn -q -B -DskipTests clean package

# 2) 실행 단계 (가벼운 JRE)
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/dms-landing.jar app.jar

# 문의/설정 데이터 저장 위치. 호스팅의 영구 디스크를 /data 에 마운트하면 재배포에도 보존됩니다.
ENV DMS_DATA_DIR=/data
VOLUME ["/data"]

# 호스팅이 주입하는 $PORT 를 사용(application.yml: server.port=${PORT:8080})
EXPOSE 8080
ENTRYPOINT ["sh","-c","java -XX:MaxRAMPercentage=75 -jar app.jar"]
