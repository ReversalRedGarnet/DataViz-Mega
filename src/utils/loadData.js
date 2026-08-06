// Fetch helper for the static JSON files produced by
// data-pipeline/clean_data.py into /public/data/.
export async function loadDataset(filename) {
  const res = await fetch(`/data/${filename}`)
  if (!res.ok) {
    throw new Error(`Failed to load dataset: ${filename}`)
  }
  return res.json()
}
