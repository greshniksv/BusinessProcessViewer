using BusinessProcessViewer.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessProcessViewer.Controllers
{
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;

        public HomeController(ILogger<HomeController> logger)
        {
            _logger = logger;
        }

        public IActionResult Index()
        {
            return View();
        }

        public IActionResult Privacy()
        {
            return View();
        }

        public IActionResult Viewer()
        {
            return View();
        }

        public IActionResult GetProcess()
        {
            string json;
            using (TextReader reader = new StreamReader(
                @"E:\Projects\BusinessProcessViewer\BusinessProcessViewer\1.json", Encoding.UTF8))
            {
                json = reader.ReadToEnd();
            }

            return Content(json, "application/json", Encoding.UTF8);
        }


        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}
