// app/api/search/route.js
import { searchFromEmbedding } from "@/features/searchFromEmbedding";

export async function POST(request:any) {
    try {
        const { queryvector,vectorDataSet } = await request.json();
        const results = await searchFromEmbedding(queryvector,vectorDataSet);
        return new Response(JSON.stringify(results), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
            },
        });
    } catch (error) {
        console.error("Error in API route:", error);
        return new Response(JSON.stringify({ error: "Failed to search" }), {
            status: 500,
            headers: {
                "Content-Type": "application/json",
            },
        });
    }
}
