import { Request, Response } from "express";
import { CountryResponse, CreateCountryBody } from "./country.model";
import * as CountryService from "./country.service";

/**
 * GET /countries
 * Retrieve all countries
 * Response:
 *   200 OK => array of CountryResponse
 *   404 Not Found => if no countries found
 *   500 Server Error
 */
export const getAllCountries = async (_req: Request, res: Response) => {
  // The first parameter was previously named `res` but typed as a Response.
  // Express passes the Request first, so every `res.status(...)` call here was
  // actually `request.status(...)` -- undefined -- throwing a TypeError and
  // making this endpoint return 500 on every request, in every DB state.
  try {
    const countries = await CountryService.getAll();
    // An empty collection is a valid empty list, not a 404. Returning 404 here
    // broke the country dropdown on a fresh database.
    res.status(200).json(countries);
  } catch (err) {
    return res.status(500).json({ message: "Server Error" });
  }
};

/**
 * POST /countries
 * Create a single country
 * Body: { name: string, code: string }
 * Response:
 *   201 Created => created CountryResponse
 *   400 Bad Request => missing name or code
 *   500 Server Error
 */
export const createCountry = async (
  req: Request<{}, CountryResponse, CreateCountryBody>,
  res: Response<{}, CountryResponse>
) => {
  try {
    const { name, code } = req.body;
    if (!name || !code) {
      return res.status(400).json({ message: "name or code is required" });
    }
    const country = await CountryService.create(req.body);
    res.status(201).json(country);
  } catch (err) {
    return res.status(500).json({ message: "Server Error" });
  }
};

/**
 * POST /countries/create/bulk
 * Create multiple countries
 * Body: array of { name: string, code: string }
 * Response:
 *   201 Created => array of created CountryResponse
 *   400 Bad Request => empty array or missing fields
 *   500 Server Error
 */
export const createCountries = async (
  req: Request<{}, CountryResponse[], CreateCountryBody[]>,
  res: Response<CountryResponse[]>
) => {
  try {
    const countriesData = req.body;
    if (!Array.isArray(countriesData) || countriesData.length === 0) {
      return res.status(400).json({
        message: "Request body must be a non-empty array of countries.",
      } as any);
    }

    const invalidCountry = countriesData.find((c) => !c.name || !c.code);
    if (invalidCountry) {
      return res.status(400).json({
        message: "Every country object must have 'name' and 'code'.",
      } as any);
    }
    const savedCountries = await CountryService.createMany(countriesData);

    res.status(201).json(savedCountries);
  } catch (err: any) {
    return res
      .status(500)
      .json({ message: err.message || "Server Error" } as any);
  }
};
