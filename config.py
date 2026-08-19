code_content = """const KUTS_CONFIG = {
  APP_NAME: "KUTS",
  APP_TITLE: "Kinetic Unified Temporal Synchronization",
  VERSION: "1.0.0",
  ENTRY_PAGE: "dashboard.html",
  IPFS_GATEWAY: "https://ipfs.io/ipfs/",
  BOOT_DELAY: 2000
};"""

with open("kuts_config.js", "w") as f:
    f.write(code_content)