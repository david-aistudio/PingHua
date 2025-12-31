const val = "PGRpdiBzdHlsZT0icG9zaXRpb246cmVsYXRpdmU7cGFkZGluZy1ib3R0b206NTYuMjUlO2hlaWdodDowO292ZXJmbG93OmhpZGRlbjsiPjxpZnJhbWUgc3R5bGU9IndpZHRoOjEwMCU7aGVpZ2h0OjEwMCU7cG9zaXRpb246YWJzb2x1dGU7bGVmdDowcHg7dG9wOjBweDtvdmVyZmxvdzpoaWRkZW4iIGZyYW1lYm9yZGVyPSIwIiB0eXBlPSJ0ZXh0L2h0bWwiIHNyYz0iaHR0cHM6Ly93d3cuZGFpbHltb3Rpb24uY29tL2VtYmVkL3ZpZGVvL2sxVVZUOVRYN3RXNXNsRXdVbk0iIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiICAgYWxsb3c9ImF1dG9wbGF5IiBhbGxvd2Z1bGxzY3JlZW4+PC9pZnJhbWU+PC9kaXY+";

try {
    const decoded = Buffer.from(val, 'base64').toString('utf-8');
    console.log("Decoded HTML:", decoded);
    
    const match = decoded.match(/src="([^"]+)"/);
    console.log("Extracted SRC:", match ? match[1] : "NOT FOUND");
} catch(e) {
    console.log("Decode Failed:", e.message);
}
