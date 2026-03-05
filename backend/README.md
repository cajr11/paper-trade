# Paper Trade Backend

### Folder Structure

The backend uses a Domain-Driven Design pattern for structuring the repo. The application is divided into domains, where each domain owns its own layers, including models, repositories, and services.

```
backend
├── cmd                    # Command-related files
│   └── app                # Application entry point
│       └── main.go        # Main application logic
├── internal               # Internal codebase
│   ├── transaction        # Domain 'transaction'
│       ├── handler.go     # Transaction-specific handler
│       ├── service.go     # Transaction-specific service
│       ├── repository.go  # Transaction-specific repository
│       └── transaction.go # Transaction model
├── pkg                    # Shared utilities
├── config                 # Configuration files
├── go.mod                 # Go module definition
└── go.sum                 # Go module checksum file

```

## Docker

#### Using Dockerfile only

To build an image from the Dockerfile, in the backend root run:

```
docker build -t image-name-preference .
```

To run a container from the built image:

```
docker run -d -p host:container image-name-preference .
```

To bind mount the local source files to the container in order to enable hot reloads:

```
docker run -d --name my_site -p host-port:container-port --mount type=bind,source=/absolute/path/to/source,target=/container/path image-name
```

#### Docker Compose

To start up all backend services in a multi-container app, run:

```
docker compose up
```

and to stop and remove containers, networks, and, optionally, volumes and images created run:

```
docker compose down
```
