# I'm Not Scared Of The Bad Guys Site

Static coming-soon page in `public/`. No JavaScript, build step, database, or secrets required.

## Run locally

```sh
docker build --pull -t notscared-site .
docker run --rm -p 3000:3000 notscared-site
```

Open http://localhost:3000. Unknown paths return 404.

Pushes to `main` publish `ghcr.io/jackharrhy/notscared-site:main` through the existing GitHub Actions workflow. Deployment is separate.
