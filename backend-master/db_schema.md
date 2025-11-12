```
Auth_Stage: PASSWORD | MFA | EMAIL_VERIFIED
Role: ADMIN | RESEARCHER | ORGANIZATION

user: {
	id: int, unique
	name: string
	email: string, unique
	hashed_password: string
	salt: string
	totp_secret: string
	auth_stage: Auth_Stage
	role: Role
	
}

report: {
	
	job_request_id: foreign_key[job_request]
	user_id: foreign_key[user]
}

comment: {

	user_id: foreign_key[user]
	report_id: foreign_key[user]
}

job_request: {
	
	organization_id: foreign_key[user]
}
```
