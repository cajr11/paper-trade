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
