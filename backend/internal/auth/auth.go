package auth

type Session struct {
	Token string `json:"token"`
	User  UserResponse `json:"user"`
}

type UserResponse struct {
	ID       string  `json:"id"`
	Email    string  `json:"email"`
	FullName string  `json:"full_name"`
	Username *string `json:"username"`
	Phone    *string `json:"phone"`
	Balance  float64 `json:"balance"`
}

type UpdateProfileRequest struct {
	FullName string  `json:"full_name" validate:"required,min=2"`
	Email    string  `json:"email" validate:"required,email"`
	Username *string `json:"username"`
	Phone    *string `json:"phone"`
}

type ChangePasswordRequest struct {
	CurrentPassword string `json:"current_password" validate:"required"`
	NewPassword     string `json:"new_password" validate:"required,min=8"`
}

type LoginRequest struct {
	Email    string `validate:"required,email" json:"email"`
	Password string `validate:"required,min=8" json:"password"`
}

type SignupRequest struct {
	FullName string `validate:"required,min=2" json:"full_name"`
	Email    string `validate:"required,email" json:"email"`
	Password string `validate:"required,min=8" json:"password"`
}
