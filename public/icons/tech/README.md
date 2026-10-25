# Technology icon sources

These SVGs are stored locally; rendering them does not contact an icon CDN.
Their path geometry is preserved. The interface uses CSS masks to apply the
website's foreground color in both themes.

- Java, Python, C, Spring, MySQL, Redis, Linux, Docker, Next.js and Git:
  [Devicon](https://github.com/devicons/devicon), from `icons/<name>/` on `master`.
  `java`, `python`, `redis`, `linux`, `docker`, `nextjs`, and `git` use
  the `plain` version; C, Spring and MySQL use `original`.
  The MIT license is preserved in `DEVICON-LICENSE`.
  Spring AI uses the Spring leaf mark.
- FastAPI: the [official `icon-white.svg`](https://github.com/fastapi/fastapi/blob/master/docs/en/docs/img/icon-white.svg).
  Its current diagonal lightning cutout is preserved as a compound path; only
  the empty canvas is cropped to align with the other 20px icons. The CSS mask
  keeps the lightning transparent in both themes. Its MIT license appears below.
- Spring Boot (`springboot.svg`) and LangGraph (`langgraph-logo.svg`):
  SVG files supplied by the site owner, copied without modification. Their
  original viewBox and path geometry are preserved; CSS masks apply the same
  theme color as the other technology badges.
- MCP: [Simple Icons source](https://github.com/simple-icons/simple-icons/blob/develop/icons/modelcontextprotocol.svg).
  The Simple Icons license is preserved in `SIMPLE-ICONS-LICENSE`.
- OpenAI Agents SDK: the blossom from the [official SDK documentation logo](https://github.com/openai/openai-agents-python/blob/main/docs/assets/logo.svg).
  The path is unchanged; the viewBox crops only the surrounding empty canvas
  so the mark aligns with the other icons. The repository's MIT license is
  preserved in `OPENAI-AGENTS-LICENSE`.
- RAG uses a generic document-search drawing in `components/tech-icons.tsx`;
  it is a technique, so no product logo is implied.

Product names and marks belong to their respective owners. Their appearance
identifies the listed tools and does not imply endorsement.

## FastAPI icon license

Source: [FastAPI](https://github.com/fastapi/fastapi/blob/master/LICENSE).

```text
The MIT License (MIT)

Copyright (c) 2018 Sebastián Ramírez

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
```
