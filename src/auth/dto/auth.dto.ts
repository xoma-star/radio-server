export class AuthLoginDto{
    readonly name: string
    readonly password: string
}

export class AuthSignUpDto extends AuthLoginDto{
    readonly email: string
}