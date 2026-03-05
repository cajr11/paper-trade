# Get go package and set container directory
FROM golang:1.25-alpine
WORKDIR /usr/local/paper-trade-backend

# Install air for live refresh
RUN go install github.com/air-verse/air@latest

# Copy dependency files separately before copying source code
# Docker caches each step, if all files were copied first, any code change         
# would invalidate the cache at that layer and force go mod download to re-run on next build
COPY go.mod go.sum .

# Install dependencies
RUN go mod download

# Copy source files
COPY . .

# Expose marks this port as one the container intends to use
# Will still need to map it the with docker run -p host:container or in the compose file (-p for publish which does the mapping)
# Without mapping, nothing outside the container can reach it
EXPOSE 8080

# Creates a non-root user
# This limits permissions and aids in stuff like reducing a hacker's attack surface area in a container
# They can't install system packages, modify system files, etc
# -D to disable password
RUN adduser -D ppr-trd-usr
USER ppr-trd-usr

CMD ["air", "-c", ".air.toml"]