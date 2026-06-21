import asyncio


async def delay_echo(message: str, delay: float) -> str:
    await asyncio.sleep(delay)
    return message


async def gather_echoes(messages: list[str], delay: float) -> list[str]:
    return list(await asyncio.gather(*(delay_echo(m, delay) for m in messages)))


async def first_success(coros: list) -> object:
    tasks = {asyncio.create_task(c) for c in coros}
    done, pending = await asyncio.wait(tasks, return_when=asyncio.FIRST_COMPLETED)
    for task in pending:
        task.cancel()
    return next(iter(done)).result()
