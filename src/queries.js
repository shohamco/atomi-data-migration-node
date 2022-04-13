const mainTableQuery = (databaseName) => {
  return `
  SELECT 
    campaign.id as campaignID, 
    campaign.name as campaignName,
    campaign.description as campaignDescription,
    camp_cat.id as campaignCategoryID, 
    camp_cat.title as campaignCategoryName,
    camp_cat.description as campaignCategoryDescription,
    res.messageID,
    res.messageType,
    res.mediumType,
    res.messageName,
    res.messageCategoryID,
    res.messageCategoryName,
    res.messageCategoryDescrition,
    res.messageDescription,
    res.messagesSent,
    res.emailsRead,
    res.emailsOpened
  FROM ${databaseName}.campaigns campaign
  LEFT JOIN ${databaseName}.categories camp_cat
  ON camp_cat.id = campaign.category_id 
  LEFT JOIN (
  SELECT 
    cee.campaign_id,
      e.id as messageID,
      NULL as messageType,
      "email" as mediumType,
      e.name as messageName,
      cat_e.id as messageCategoryID,
      cat_e.title as messageCategoryName,
      cat_e.description as messageCategoryDescrition,
      e.description as messageDescription,
      e_stats.messagesSent,
      e_stats.emailsRead,
      e_stats.emailsOpened
  FROM (SELECT * FROM ${databaseName}.campaign_events WHERE channel = "email") cee
  LEFT JOIN ${databaseName}.emails e
  ON e.id = cee.channel_id
  LEFT JOIN (
      SELECT 
        es.email_id, 
        COUNT(*) as messagesSent, 
        SUM(es.is_read) as emailsRead, 
        SUM(es.open_count) as emailsOpened
    FROM ${databaseName}.email_stats es
    GROUP BY es.email_id
  ) e_stats ON e_stats.email_id = e.id
  LEFT JOIN ${databaseName}.categories cat_e
  ON cat_e.id = e.category_id
  UNION ALL 
  SELECT 
    cem.campaign_id,
      vm.id as messageID,
      vm.sms_type as messageType,
      "message" as mediumType,
      vm.name as messageName,
      cat_m.id as messageCategoryID,
      cat_m.title as messageCategoryName,
      cat_m.description as messageCategoryDescrition,
      vm.description as messageDescription,
      vm.sent_count as messagesSent,
      NULL as emailsRead,
      NULL as emailsOpened
  FROM (SELECT * FROM ${databaseName}.campaign_events WHERE channel = "message") cem
  LEFT JOIN ${databaseName}.vonage_messages vm 
  ON vm.id = cem.channel_id
  LEFT JOIN ${databaseName}.categories cat_m
  ON cat_m.id = vm.category_id
  ) res
  ON res.campaign_id = campaign.id
  WHERE campaign.id IN (4, 29, 33, 34, 17, 18, 32, 7, 30, 31, 35, 36, 37, 38, 39, 40, 41, 44, 45, 46, 43, 47, 42, 28)
  ORDER BY campaign.id
      `;
};

const pagesTableQuery = (databaseName) => {
  return `
  SELECT 
  campaign.id as campaignID, 
    res.messageID,
    res.mediumType,
    res.pageID,
    res.pageName,
    res.pageType,
    res.hits,
    res.uniqueHits
    FROM ${databaseName}.campaigns campaign
    LEFT JOIN (
    SELECT 
      cee.campaign_id,
      e.id as messageID,
      "email" as mediumType,
      eru.pageID,
      eru.pageName,
      eru.pageType,
      eru.hits,
      eru.uniqueHits
    FROM (
      SELECT * FROM ${databaseName}.campaign_events 
      WHERE channel = "email"
    ) cee
    LEFT JOIN ${databaseName}.emails e
    ON e.id = cee.channel_id 
    LEFT JOIN (
      SELECT 
        cutu.channel_id, 
        cutu.channel,
        epu.id as pageID,
        epu.title as pageName,
        IF (pru.url LIKE '%unsubscribe%', "unsubscribe", "thank_you") as pageType,
        pru.hits,
        pru.unique_hits as uniqueHits,
        pru.id as redirect_id
      FROM ${databaseName}.channel_url_trackables cutu
      LEFT JOIN ${databaseName}.page_redirects pru
      ON cutu.redirect_id = pru.id
      JOIN ${databaseName}.pages epu
      ON REPLACE(pru.url, "https://wobi.personalx.co.il/", "") = epu.alias
      WHERE pru.url LIKE '%unsubscribe%' OR pru.url LIKE '%thank%' AND cutu.channel = "email"
    ) eru
    ON eru.channel_id = e.id 
    UNION ALL
    SELECT 
      cem.campaign_id,
      vm.id as messageID,
      "message" as mediumType,
      pages.id as pageID,
      pages.title as pageName,
      IF (vm.page_change_field = pages.id, "thank_you", "unsubscribe") as pageType,
      pages.hits,
      pages.unique_hits as uniqueHits
    FROM (
      SELECT * FROM ${databaseName}.campaign_events 
      WHERE channel = "message"
    ) cem
    LEFT JOIN ${databaseName}.vonage_messages vm 
    ON vm.id = cem.channel_id AND cem.channel = "message"
    LEFT JOIN ${databaseName}.pages pages
    ON vm.page_change_field = pages.id OR vm.page_unsubscribe = pages.id
    ) res 
    ON res.campaign_id = campaign.id
    WHERE campaign.id IN (4, 29, 33, 34, 17, 18, 32, 7, 30, 31, 35, 36, 37, 38, 39, 40, 41, 44, 45, 46, 43, 47, 42, 28)
    `;
};

const segmentsTableQuery = (databaseName) => {
  return `
    SELECT 
        camp.id as campaignID, 
        camp.name as campaignName,
        camp.description as campaignDescription,
        ll.id as segmentID,
        ll.name as segmentName,
        ll.description as segmentDescription,
        IF(l_c.contactNumber is null, 0, l_c.contactNumber) as contactNumber
    FROM ${databaseName}.campaigns as camp
    LEFT JOIN ${databaseName}.campaign_leadlist_xref clx 
    ON clx.campaign_id = camp.id
    RIGHT JOIN ${databaseName}.lead_lists ll
    ON ll.id = clx.leadlist_id
    LEFT JOIN (
        SELECT lll.leadlist_id, count(*) as contactNumber
        FROM ${databaseName}.lead_lists_leads lll
        WHERE lll.manually_removed = 0
        GROUP BY lll.leadlist_id
    ) l_c ON l_c.leadlist_id = ll.id 
    WHERE camp.id IN (4, 29, 33, 34, 17, 18, 32, 7, 30, 31, 35, 36, 37, 38, 39, 40, 41, 44, 45, 46, 43, 47, 42, 28)
    ORDER BY camp.id
    `;
};
const segmentsTableQueryAll = (databaseName) => {
  return `
    SELECT 
        ll.id as segmentID,
        ll.name as segmentName,
        ll.description as segmentDescription,
        IF(l_c.contactNumber is null, 0, l_c.contactNumber) as contactNumber
    FROM ${databaseName}.lead_lists ll
    LEFT JOIN (
        SELECT lll.leadlist_id, count(*) as contactNumber
        FROM ${databaseName}.lead_lists_leads lll
        WHERE lll.manually_removed = 0
        GROUP BY lll.leadlist_id
    ) l_c ON l_c.leadlist_id = ll.id 
    ORDER BY ll.id
    `;
};

module.exports = {
  mainTableQuery,
  segmentsTableQuery,
  pagesTableQuery,
  segmentsTableQueryAll
};
