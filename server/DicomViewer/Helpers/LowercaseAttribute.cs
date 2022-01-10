using System;
using System.ComponentModel.DataAnnotations;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using MongoDB.Bson.IO;

namespace DicomViewer.Helpers
{
    public class LowercaseAttribute : ValidationAttribute
    {
        protected override ValidationResult IsValid(object value, ValidationContext validationContext)
        {
            //try to modify text
            try
            {
                validationContext
                    .ObjectType
                    ?.GetProperty(validationContext.MemberName)
                    ?.SetValue(validationContext.ObjectInstance, value.ToString().ToLower(), null);
            }
            catch (System.Exception)
            {
            }

            //return null to make sure this attribute never say iam invalid
            return ValidationResult.Success;
        }
    }
}