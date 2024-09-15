from transformers import Speech2TextProcessor, Speech2TextForConditionalGeneration

import base64
import io
import soundfile as sf
import re
import wave
import os

model = Speech2TextForConditionalGeneration.from_pretrained("facebook/s2t-small-librispeech-asr")
processor = Speech2TextProcessor.from_pretrained("facebook/s2t-small-librispeech-asr")

def correct_base64_string(base64_string: str) -> str:
    pattern = r'data:audio/[^;]*;base64,(.*)'
    match = re.search(pattern, base64_string)
    if match:
        print(match.group(1))
        return match.group(1)
    return base64_string

def base_64_to_audio(base_64_string: str, file_name: str, dst_dir: str) -> str:
    base_64_string = correct_base64_string(base_64_string)
    audio_bytes = base64.b64decode(base_64_string)
    with open(dst_dir, "wb") as f:
        f.write(audio_bytes)
    
    return dst_dir

def speech_to_text(audio_path: str) -> str:
    audio, sr = sf.read(audio_path)
    inputs = processor(audio, sampling_rate=sr, return_tensors="pt")
    generated_ids = model.generate(inputs["input_features"], attention_mask=inputs["attention_mask"])
    transcription = processor.batch_decode(generated_ids, skip_special_tokens=True)
    return transcription[0]

if __name__ == "__main__":
    base_64_string = base64.b64encode(open("./test/output_audio.wav", "rb").read()).decode()
    print(speech_to_text("audio.wav"))