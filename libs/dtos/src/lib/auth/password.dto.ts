import {
  IsEmail,
  IsNotEmpty,
  IsPhoneNumber,
  MinLength,
  ValidateIf,
} from "class-validator";

export class ForgotPasswordDto {
  @ValidateIf((o) => !o.phone_number)
  @IsEmail({}, { message: "ایمیل معتبر نیست" })
  email: string;

  @ValidateIf((o) => !o.email)
  @IsPhoneNumber("IR", { message: "شماره موبایل معتبر نیست" })
  phone_number: string;
}

export class ChangePasswordDto {
  @ValidateIf((o) => !o.phone_number)
  @IsEmail({}, { message: "ایمیل معتبر نیست" })
  email: string;

  @ValidateIf((o) => !o.email)
  @IsPhoneNumber("IR", { message: "شماره موبایل معتبر نیست" })
  phone_number: string;

  @IsNotEmpty({ message: "کلمه عبور نباید خالی باشد" })
  @MinLength(6, { message: "کلمه عبور باید حداقل 6 کاراکتر داشته باشد" })
  password?: string;

  @IsNotEmpty({ message: "تکرار کلمه عبور نباید خالی باشد" })
  @MinLength(6, { message: "تکرار کلمه عبور باید حداقل 6 کاراکتر داشته باشد" })
  passwordConfirm?: string;

  @IsNotEmpty({ message: "کد یک بار مصرف نباید خالی باشد" })
  @MinLength(4, { message: "کد یک بار مصرف باید حداقل 4 کاراکتر داشته باشد" })
  otp?: string;
}
