import { z } from "zod";

/**
 * Schema xác thực dữ liệu Đăng nhập
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Vui lòng nhập địa chỉ email.")
    .email("Định dạng email không hợp lệ."),
  password: z
    .string()
    .min(1, "Vui lòng nhập mật khẩu."),
});

export type LoginFormData = z.infer<typeof loginSchema>;

/**
 * Tiêu chuẩn mật khẩu an toàn theo quy chuẩn y tế
 */
export const passwordRules = z
  .string()
  .min(8, "Mật khẩu phải chứa ít nhất 8 ký tự.")
  .max(100, "Mật khẩu không được vượt quá 100 ký tự.")
  .regex(/[A-Z]/, "Mật khẩu phải chứa ít nhất 1 chữ in hoa (A-Z).")
  .regex(/[a-z]/, "Mật khẩu phải chứa ít nhất 1 chữ in thường (a-z).")
  .regex(/\d/, "Mật khẩu phải chứa ít nhất 1 chữ số (0-9).");

/**
 * Schema xác thực dữ liệu Đăng ký tài khoản
 */
export const registerSchema = z
  .object({
    email: z
      .string()
      .min(1, "Vui lòng nhập địa chỉ email.")
      .email("Địa chỉ email không đúng định dạng."),
    password: passwordRules,
    confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu."),
    full_name: z
      .string()
      .max(150, "Họ và tên không được vượt quá 150 ký tự.")
      .optional()
      .or(z.literal("")),
    date_of_birth: z.string().optional().or(z.literal("")),
    gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
    height_cm: z
      .number()
      .min(40, "Chiều cao tối thiểu là 40 cm.")
      .max(250, "Chiều cao tối đa là 250 cm.")
      .optional()
      .nullable(),
    weight_kg: z
      .number()
      .min(15, "Cân nặng tối thiểu là 15 kg.")
      .max(300, "Cân nặng tối đa là 300 kg.")
      .optional()
      .nullable(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không trùng khớp.",
    path: ["confirmPassword"],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

/**
 * Schema xác thực Đổi mật khẩu
 */
export const changePasswordSchema = z
  .object({
    current_password: z.string().min(1, "Vui lòng nhập mật khẩu hiện tại."),
    new_password: passwordRules,
    confirm_new_password: z.string().min(1, "Vui lòng xác nhận mật khẩu mới."),
  })
  .refine((data) => data.new_password === data.confirm_new_password, {
    message: "Mật khẩu mới xác nhận không khớp.",
    path: ["confirm_new_password"],
  })
  .refine((data) => data.current_password !== data.new_password, {
    message: "Mật khẩu mới không được trùng với mật khẩu cũ.",
    path: ["new_password"],
  });

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
