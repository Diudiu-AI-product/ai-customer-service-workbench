import json
from pathlib import Path
from collections import Counter


DATASET_PATH = Path(__file__).with_name("sample_dataset.jsonl")


def load_samples(path: Path):
    samples = []
    with path.open("r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            samples.append(json.loads(line))
    return samples


def summarize(samples):
    intent_counter = Counter(sample["gold_intent"] for sample in samples)
    risk_counter = Counter(sample["risk_level"] for sample in samples)
    reply_counter = Counter(sample["should_reply"] for sample in samples)

    print("评测样本概览")
    print("-" * 30)
    print(f"样本总数: {len(samples)}")
    print(f"意图分布: {dict(intent_counter)}")
    print(f"风险等级分布: {dict(risk_counter)}")
    print(f"是否需要回复: {dict(reply_counter)}")


def main():
    if not DATASET_PATH.exists():
        raise FileNotFoundError(f"未找到数据集文件: {DATASET_PATH}")

    samples = load_samples(DATASET_PATH)
    summarize(samples)


if __name__ == "__main__":
    main()
