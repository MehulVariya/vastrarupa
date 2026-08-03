import { NextResponse } from "next/server";
import { z } from "zod";

const pincodeSchema = z.string().length(6).regex(/^\d+$/);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pincode = searchParams.get("pincode");

  const validation = pincodeSchema.safeParse(pincode);
  if (!validation.success) {
    return NextResponse.json(
      { error: "Invalid Pincode format. Must be exactly 6 digits." },
      { status: 400 }
    );
  }

  const pinStr = validation.data;
  const pinNum = Number(pinStr);

  // Pincodes starting with 999 are not serviceable in our mockup
  if (pinStr.startsWith("999")) {
    return NextResponse.json(
      { error: "Service Not Available for this location." },
      { status: 404 }
    );
  }

  // Delivery configuration based on regions
  let expectedDays = 3;
  let hasCod = true;
  let hasExpress = true;

  if (
    pinStr.startsWith("1") || 
    pinStr.startsWith("4") || 
    pinStr.startsWith("3") || 
    pinStr.startsWith("5")
  ) {
    expectedDays = 2; // Metros & main hubs: 2 days
  } else {
    expectedDays = 5; // Interior regions: 5 days
    hasExpress = false;
  }

  // Disable COD for select test regions
  if (pinNum % 7 === 0) {
    hasCod = false;
  }

  const expectedDate = new Date();
  expectedDate.setDate(expectedDate.getDate() + expectedDays);
  
  const options: Intl.DateTimeFormatOptions = { 
    weekday: 'long', 
    month: 'short', 
    day: 'numeric' 
  };
  const formattedDate = expectedDate.toLocaleDateString('en-US', options);

  return NextResponse.json({
    available: true,
    expectedDelivery: `Expected Delivery: ${formattedDate}`,
    cashOnDelivery: hasCod ? "Cash On Delivery Available" : "Prepaid Only (COD Not Available)",
    expressDelivery: hasExpress ? "Express Delivery Available" : "Standard Delivery Only",
  });
}
