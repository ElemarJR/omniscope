from setuptools import setup, find_namespace_packages

setup(
    name="omni-api-v2",
    version="0.1",
    packages=find_namespace_packages(where="src"),
    package_dir={"": "src"},
    install_requires=[
        "omni-shared",
        "omni-utils",
        "omni-models"
    ],
)