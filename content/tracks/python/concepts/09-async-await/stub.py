import asyncio


async def delay_echo(message: str, delay: float) -> str:
    # TODO: sleep for delay seconds then return message
    return ""


async def gather_echoes(messages: list[str], delay: float) -> list[str]:
    # TODO: run delay_echo concurrently for all messages using asyncio.gather
    return []


async def first_success(coros: list) -> object:
    # TODO: run all coros concurrently; return the result of the first to complete.
    # Use asyncio.wait with FIRST_COMPLETED. Cancel remaining tasks.
    return None


if __name__ == "__main__":
    async def main():
        print(await delay_echo("hello", 0.01))
        print(await gather_echoes(["a", "b", "c"], 0.01))
        print(await first_success([
            delay_echo("slow", 0.1),
            delay_echo("fast", 0.01),
        ]))

    asyncio.run(main())
