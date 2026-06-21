FROM --platform=linux/amd64 ubuntu:22.04
RUN apt-get update -qq && \
    apt-get install -qq -y nasm binutils && \
    rm -rf /var/lib/apt/lists/*
WORKDIR /code
