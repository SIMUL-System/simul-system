# ---------- Etapa 1: build ----------
FROM eclipse-temurin:21-jdk AS build

WORKDIR /app

# 1) Copia só o que define as dependências. Enquanto pom.xml e o wrapper
#    não mudarem, esta camada fica em cache e o build na Render é mais rápido.
COPY mvnw pom.xml ./
COPY .mvn .mvn
RUN chmod +x mvnw \
    && ./mvnw -B -q dependency:go-offline

# 2) Copia o código e gera o .jar (testes rodam no CI, não aqui).
COPY src src
RUN ./mvnw -B -q clean package -DskipTests

# ---------- Etapa 2: execução ----------
FROM eclipse-temurin:21-jre

WORKDIR /app

# Executa a aplicação sem privilégios de root.
RUN groupadd --system simul \
    && useradd --system --gid simul --no-create-home simul

COPY --from=build /app/target/*.jar app.jar

USER simul

EXPOSE 8080

# A instância gratuita da Render tem 512 MB de RAM: limita o heap a uma
# fração da memória do container para evitar que o processo seja encerrado
# por falta de memória. Pode ser ajustado pela variável JAVA_OPTS.
ENV JAVA_OPTS="-XX:MaxRAMPercentage=70 -XX:+UseSerialGC"

ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar app.jar"]
