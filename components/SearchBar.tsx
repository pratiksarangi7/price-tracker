"use client";

import { scrapeAndStore } from "@/lib/actions";
import { useRouter } from "next/navigation"; // Use next/navigation for App Router
import { FormEvent, useState } from "react";

const isValidAmazonProductUrl = (url: string) => {
  try {
    const parsedUrl = new URL(url);
    const hostName = parsedUrl.hostname;
    const amazonRegex =
      /^(?:[\w-]+\.)*amazon\.(com|in|co\.uk|ca|de|fr|it|es|co\.jp|com\.mx|com\.br|com\.au|nl|sg|ae|sa|se|pl)$/;
    return amazonRegex.test(hostName);
  } catch (err) {
    return false;
  }
};

const SearchBar = () => {
  const [searchPrompt, setSearchPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const isValidLink = isValidAmazonProductUrl(searchPrompt);
    if (!isValidLink) return alert("Please provide a valid amazon link!!");
    try {
      setIsLoading(true);
      const productId = await scrapeAndStore(searchPrompt);
      if (productId && productId !== "") {
        router.push(`/products/${productId}`);
      }
    } catch (error) {
      console.error("Failed to scrape and store product:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="flex flex-wrap gap-4 mt-12" onSubmit={handleSubmit}>
      <input
        type="text"
        value={searchPrompt}
        onChange={(e) => setSearchPrompt(e.target.value)}
        placeholder="Enter product link"
        className="searchbar-input"
      />
      <button
        type="submit"
        className="searchbar-btn"
        disabled={searchPrompt === ""}
      >
        {isLoading ? "..." : "Search"}
      </button>
    </form>
  );
};

export default SearchBar;
