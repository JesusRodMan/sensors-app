function getURL(resource: string): string {
  return process.env.NEXT_PUBLIC_API_URL + resource;
}

export async function getFetcher<T>(resource: string): Promise<T> {
  const url = getURL(resource);
  console.log(url)
  return await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  }).then(async (res) => {
    if (!res.ok) {
      throw new Error("Error fetching data");
    }
    return (await res.json()) as T;
  });
}

export async function putFetcher<T>(resource: string, body: any): Promise<T> {
  const url = getURL(resource);
  return await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  }).then(async (res) => {
    if (!res.ok) {
      throw new Error("Error fetching data");
    }
    return (await res.json()) as T;
  });
}

export async function postFetcher<T>(resource: string, body: any): Promise<T> {
  const url = getURL(resource);
  console.log(url)
  return await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  }).then(async (res) => {
    if (!res.ok) {
      const errorMessage = await res.text();
      throw new Error(errorMessage);
    }
    return (await res.json()) as T;
  });
}

