import os.path

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
import base64
from email.message import EmailMessage

# If modifying these scopes, delete the file token.json.
SCOPES = ["https://www.googleapis.com/auth/gmail.readonly", "https://www.googleapis.com/auth/gmail.send", "https://www.googleapis.com/auth/gmail.compose"]

# need to be run before the script can be used
def init():
  # The file token.json stores the user's access and refresh tokens, and is
  # created automatically when the authorization flow completes for the first
  # time.
  creds = None
  if os.path.exists("token.json"):
    creds = Credentials.from_authorized_user_file("token.json", SCOPES)
  # If there are no (valid) credentials available, let the user log in.
  if not creds or not creds.valid:
    if creds and creds.expired and creds.refresh_token:
      creds.refresh(Request())
    else:
        flow = InstalledAppFlow.from_client_secrets_file(
            "credentials.json", SCOPES
        )
        flow.redirect_uri = "http://localhost"
        auth_url, _ = flow.authorization_url(prompt="consent", access_type="offline")
        print("Please go to this URL and authorize access:")
        print(auth_url)

        # After authorizing, paste the authorization code here
        code = input("Enter the authorization code: ")
        flow.fetch_token(code=code)
        creds = flow.credentials
    # Save the credentials for the next run
    with open("token.json", "w") as token:
      token.write(creds.to_json())

def get_creds_closure():
  creds = None
  def get_creds():
    nonlocal creds
    if creds is not None:
      return creds
    if os.path.exists("token.json"):
      return Credentials.from_authorized_user_file("token.json", SCOPES)
    if creds and creds.refresh_token:
      creds.refresh(Request())
      # Save the credentials for the next run
      with open("token.json", "w") as token:
        token.write(creds.to_json())
      return creds
    return None
  return get_creds

get_creds = get_creds_closure()

def send_email(user_email: str, subject: str, content: str):
  """Create and send an email message
  Print the returned  message id
  Returns: Message object, including message id
  """

  service = build("gmail", "v1", credentials=get_creds())
  message = EmailMessage()

  message.set_content(content)

  print("sending to user_email", user_email, flush=True)
  message["To"] = user_email
  message["From"] = "teambytebreakers.com"
  message["Subject"] = subject

  # encoded message
  encoded_message = base64.urlsafe_b64encode(message.as_bytes()).decode()

  create_message = {"raw": encoded_message}
  # pylint: disable=E1101
  send_message = (
      service.users()
      .messages()
      .send(userId="me", body=create_message)
      .execute()
  )
  print(send_message, flush=True)
  return send_message
