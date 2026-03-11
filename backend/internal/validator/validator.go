package validator

import (
	"fmt"

	"github.com/go-playground/validator/v10"
)


var validate *validator.Validate = validator.New(validator.WithRequiredStructEnabled())



func ValidateStruct(s any) error {
	err := validate.Struct(s)

	if err != nil {
		validationErrors := err.(validator.ValidationErrors)
		fmt.Printf(`Error: %v`, validationErrors)
		return  validationErrors
	}

	return nil
}