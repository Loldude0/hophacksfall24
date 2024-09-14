from transformers import Speech2TextProcessor, Speech2TextForConditionalGeneration

import base64
import io
import soundfile as sf

model = Speech2TextForConditionalGeneration.from_pretrained("facebook/s2t-small-librispeech-asr")
processor = Speech2TextProcessor.from_pretrained("facebook/s2t-small-librispeech-asr")

def base_64_to_wav(base_64_string: str) -> str:
    

    audio_bytes = base64.b64decode(base_64_string)
    audio_file = io.BytesIO(audio_bytes)
    audio, sr = sf.read(audio_file)
    sf.write("audio.wav", audio, sr)

def speech_to_text(base_64_string: str) -> str:
    base_64_to_wav(base_64_string)
    audio, sr = sf.read("audio.wav")
    inputs = processor(audio, sampling_rate=sr, return_tensors="pt")
    generated_ids = model.generate(inputs["input_features"], attention_mask=inputs["attention_mask"])
    transcription = processor.batch_decode(generated_ids, skip_special_tokens=True)
    return transcription[0]

if __name__ == "__main__":
    base_64_string = base64.b64encode(open("./test/output_audio.wav", "rb").read()).decode()
    print(speech_to_text(base_64_string))