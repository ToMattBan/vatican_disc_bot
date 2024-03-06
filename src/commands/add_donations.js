const { SlashCommandBuilder } = require('discord.js');
const { checkPermissions } = require('../utils/check_permission');

var yesterday = new Date(new Date().getTime() - 24 * 60 * 60 * 1000);

const owner = 'ToMattBan';
const repo = 'resource_calculator';
const path = 'src/store/donations.json';
const token = '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';
const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
let sha = null;

async function getExistingJson() {
  try {
    const response = await fetch(apiUrl, { headers });

    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.statusText}`);
    }

    const data = await response.json();
    sha = data.sha;

    const content = Buffer.from(data.content, 'base64').toString('utf-8');

    return (JSON.parse(content))

  } catch (error) {
    console.error('Error:', error.message);
  }
}

async function createNewJson(donationLog) {
  function capitalize(name) {
    return name.charAt(0).toUpperCase() + name.slice(1);
  }

  var yesterdayJson = {};

  const sanitized = donationLog.split('Guild Log')[1].split('Maximum')[0].trim();

  const entries = sanitized
    .split(':')
    .map(entry => entry.replace(/[0-9]/g, '').replace(' X', '').trim())
    .filter(entry => entry.includes('has performed'));

  entries.forEach((donation) => {
    let [name, typeDonation] = donation
      .replace(" donation.", "")
      .replace(" Donation.", "")
      .split(" has performed ");

    if (name == "Elliottelune") name = "ElliotteLune";

    if (!(capitalize(name) in yesterdayJson)) {
      yesterdayJson[capitalize(name)] = {};
    }

    const donationType = typeDonation.toLowerCase();
    if (!(donationType in yesterdayJson[capitalize(name)])) {
      yesterdayJson[capitalize(name)][donationType] = 0;
    }

    yesterdayJson[capitalize(name)][donationType]++;
  });

  yesterdayJson = Object.fromEntries(Object.entries(yesterdayJson).sort());

  return yesterdayJson;
}

async function updateJson(existingJson, yesterdayJson) {
  function mergeAndSum(json1, json2) {
    const result = {};

    for (const name in { ...json1, ...json2 }) {
      result[name] = {};

      for (const key in { ...json1[name], ...json2[name] }) {
        result[name][key] = (json1[name]?.[key] ?? 0) + (json2[name]?.[key] ?? 0);
      }
    }

    return result;
  }

  if (existingJson[yesterday.toISOString().split("T")[0]]) {
    existingJson[yesterday.toISOString().split("T")[0]] = mergeAndSum(existingJson[yesterday.toISOString().split("T")[0]], yesterdayJson)
  } else {
    existingJson[yesterday.toISOString().split("T")[0]] = yesterdayJson;
  }

  return existingJson
}

async function updateLog(newJson) {
  try {
    const updatedFileContent = Buffer.from(JSON.stringify(newJson, null, 2)).toString('base64');

    const updateResponse = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Updated Donations JSON',
        content: updatedFileContent,
        sha: sha,
        committer: {
          name: owner,
          email: 'souaquelecleyton@gmail.com',
        },
      }),
    });

    if (!updateResponse.ok) {
      const responseBody = await updateResponse.text();
      throw new Error(`Failed to update file. Status: ${updateResponse.status}, Response: ${responseBody}`);
    }

    console.log('File successfully updated.');
    return true;
  } catch (error) {
    console.error('Error:', error.message);
    return false;
  }
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('add_donation')
    .setDescription('Add new donation report')
    .addStringOption((option) =>
      option
        .setName('donation_report')
        .setDescription('The report converted from image to text')
        .setRequired(true)
    ),

  async execute(interaction) {
    if (!checkPermissions(interaction, "senate")) return;

    const existingJson = await getExistingJson();

    const donationLog = interaction.options.getString("donation_report");
    const yesterdayJson = await createNewJson(donationLog);

    const updatedJson = await updateJson(existingJson, yesterdayJson);

    if (updateLog(updatedJson)) await interaction.reply(
      `Donations report updated, wait up tp 5 minutes to see the results in https://resource-calculator.vercel.app/donations`
    );
  }
}
