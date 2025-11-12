from enum import Enum
from db.client import db_client
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String
from datetime import datetime
from typing import Optional, List

class BaseModel(db_client.Model):
    __abstract__ = True

    id: Mapped[int] = mapped_column(primary_key=True)
    created_at: Mapped[datetime] = mapped_column(server_default=db_client.func.now())
    updated_at: Mapped[datetime] = mapped_column(server_default=db_client.func.now(), server_onupdate=db_client.func.now())


class AuthStage(Enum):
    PASSWORD = 'password'
    PENDING_MFA = 'pending_mfa' # user hasn't entered their first TOTP code yet
    MFA_VERIFIED = 'mfa_verified'
    EMAIL_VERIFIED = 'email_verified'

class Role(Enum):
    ADMIN = 'admin'
    RESEARCHER = 'researcher'
    ORGANIZATION = 'organization'

class JobRequestState(Enum):
    CREATED = 'created' # created, but not submitted for approval
    SUBMITTED = 'submitted'
    REJECTED = 'rejected'
    APPROVED = 'approved'
    ARCHIVED = 'archived' # "deleted" but visible for creater

class ReportState(Enum):
    SUBMITTED = 'submitted'
    REJECTED = 'rejected'
    ACCEPTED = 'accepted'

class User(BaseModel):
    __tablename__ = 'users'
    
    name: Mapped[str] = mapped_column(String(100))
    email: Mapped[str] = mapped_column(unique=True)
    password: Mapped[str] = mapped_column()
    salt: Mapped[str] = mapped_column()
    totp_secret: Mapped[Optional[str]] = mapped_column()
    auth_stage: Mapped[AuthStage] = mapped_column(default=AuthStage.PASSWORD)
    role: Mapped[Role] = mapped_column()
    md: Mapped[str] = mapped_column() # json object

    # relationships
    reports: Mapped[List["Report"]] = relationship('Report', back_populates='user')
    comments: Mapped[List["Comment"]] = relationship('Comment', back_populates='user')
    job_requests: Mapped[List["JobRequest"]] = relationship('JobRequest', back_populates='organization')



class Report(BaseModel):
    __tablename__ = 'reports'
    
    content: Mapped[str] = mapped_column()
    user_has_unread: Mapped[bool] = mapped_column()
    org_has_unread: Mapped[bool] = mapped_column()
    status: Mapped[ReportState] = mapped_column()

    # relationships
    comments: Mapped[List["Comment"]] = relationship('Comment', back_populates='report')

    user_id: Mapped[int] = mapped_column(db_client.ForeignKey('users.id'))
    user: Mapped["User"] = relationship('User', back_populates='reports')

    job_request_id: Mapped[int] = mapped_column(db_client.ForeignKey('job_requests.id'))
    job_request: Mapped["JobRequest"] = relationship('JobRequest', back_populates='report')

class Comment(BaseModel):
    __tablename__ = 'comments'

    content: Mapped[str] = mapped_column()

    # relationships
    user_id: Mapped[int] = mapped_column(db_client.ForeignKey('users.id'))
    user: Mapped["User"] = relationship('User', back_populates='comments')

    report_id: Mapped[int] = mapped_column(db_client.ForeignKey('reports.id'))
    report: Mapped["Report"] = relationship('Report', back_populates='comments')

class JobRequest(BaseModel):
    __tablename__ = 'job_requests'

    title: Mapped[str] = mapped_column()
    summary: Mapped[str] = mapped_column()
    description: Mapped[str] = mapped_column()
    state: Mapped[JobRequestState] = mapped_column(default=JobRequestState.CREATED)
    disclosure_policy_url: Mapped[str] = mapped_column()
    tags: Mapped[str] = mapped_column() # list

    # relationships
    report: Mapped["Report"] = relationship('Report', back_populates='job_request')

    organization_id: Mapped[int] = mapped_column(db_client.ForeignKey('users.id'))
    organization: Mapped["User"] = relationship('User', back_populates='job_requests')
