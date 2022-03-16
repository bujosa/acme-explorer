variable "author" {
  description = "Name of the operator. Used as a prefix to avoid name collision on resources."
  type        = string
  default     = "do2122-latam"
}

variable "region" {
  description = "AWS region"
  type        = string
  default     = "eu-west-3" # Paris
}
