from pathlib import Path

from PIL import Image

from src.tasks.tasks import generate_gallery_image_variants


def test_generate_gallery_image_variants_creates_large_display_asset(tmp_path: Path):
    output_dir = tmp_path / "static" / "images"
    output_dir.mkdir(parents=True)
    source = Image.new("RGB", (4000, 3000), (120, 80, 40))

    variants = generate_gallery_image_variants(
        source_img=source,
        output_dir=output_dir,
        prefix="artwork_1_test",
    )

    assert set(variants) == {"original", "large", "medium", "thumb"}
    assert variants["large"].endswith("_large.webp")

    expected_sizes = {
        "original": (4000, 3000),
        "large": (2560, 1920),
        "medium": (1600, 1200),
        "thumb": (500, 375),
    }
    for variant, expected_size in expected_sizes.items():
        path = output_dir / Path(variants[variant]).name
        assert path.is_file()
        with Image.open(path) as image:
            assert image.size == expected_size
