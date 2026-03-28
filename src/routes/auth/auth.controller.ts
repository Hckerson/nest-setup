import { Body, Controller, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import type { LoginDto } from "src/common/interfaces/auth";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  async login(@Body() loginDto: LoginDto) {
    
  }
}
