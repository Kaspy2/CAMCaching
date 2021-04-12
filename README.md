# CAMCaching

Website online at: https://camcaching.web.app/

Use pull requests or directly edit the [location data](./public/locs.json).

Make sure it's well formatted `JSON`:

```json
{
    "location": "<location name>",
    "hint": "<hint>" or ["<hint1>", "<hint2>", ...],
    "coordinates": [
        <latitude :: float>,
        <longitude :: float>
    ]
}
```