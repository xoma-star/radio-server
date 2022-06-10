import {Body, Controller, Post} from "@nestjs/common";
import {SignupUserDto} from "./dto/signup-user.dto";
import { UserService } from "./user.service";

@Controller('/users')
export class UserController{
    constructor(private userService: UserService) {
    }
    @Post('/signup')
    signup(@Body() dto: SignupUserDto){
        return this.userService.signup(dto)
    }
}