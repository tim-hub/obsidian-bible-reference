import fs from 'fs';
import path from 'path';

export const readJSONFilesInDirectory = (directoryPath: string) => {
  try {
    const files: string[] = fs.readdirSync(
      directoryPath
    ) as unknown as string[];

    // Filter the files to only include JSON files
    const jsonFiles = files.filter(
      (file: string) => path.extname(file) === '.json'
    );

    return jsonFiles.map((jsonFile: string) => {
      const filePath = path.join(directoryPath, jsonFile);
      const data = fs.readFileSync(filePath);
      return JSON.parse(data.toString());
    });
  } catch (err) {
    console.error('Error reading JSON files:', err);
    throw err;
  }
};
