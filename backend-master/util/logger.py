from pathlib import Path
import os
import logging
import json

log_dir = Path('logs')
log_dir.mkdir(exist_ok=True, parents=True)

file = os.path.join(log_dir, 'app.log')
file_handler = logging.FileHandler(file, mode='a', encoding='utf-8')
file_handler.setLevel(logging.INFO)
file_handler.setFormatter(
    logging.Formatter(
        fmt="{asctime} - {levelname} - {message}", 
        datefmt="%Y-%m-%d %H:%M:%S", 
        style='{'
    )
)
file_handler.flush()
