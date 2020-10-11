<?php
namespace Destiny\Common;

use Destiny\Common\Annotation;
use Destiny\Common\Routing\Route;
use Destiny\Common\Routing\Router;
use Doctrine\Common\Annotations\Reader;
use ReflectionClass;
use ReflectionException;
use ReflectionMethod;

class ControllerAnnotationLoader {

    /**
     * @var ReflectionClass
     */
    private $controllerRef;

    /**
     * @var ReflectionClass
     */
    private $responseBodyRef;

    /**
     * @var ReflectionClass
     */
    private $httpMethodRef;

    /**
     * @var ReflectionClass
     */
    private $secureRef;

    /**
     * @var ReflectionClass
     */
    private $routeRef;

    /**
     * @var ReflectionClass
     */
    private $privateKeyRef;

    /**
     * @var ReflectionClass
     */
    private $auditKeyRef;

    /**
     * @throws ReflectionException
     */
    public static function factory(DirectoryClassIterator $classIterator, Reader $reader, Router $router) {
        $ins = new self();
        $ins->loadClasses($classIterator, $reader, $router);
    }

    /**
     * @throws ReflectionException
     */
    public function loadClasses(DirectoryClassIterator $classIterator, Reader $reader, Router $router) {
        $this->controllerRef = new ReflectionClass(new Annotation\Controller());
        $this->auditKeyRef = new ReflectionClass(new Annotation\Audit());
        $this->responseBodyRef = new ReflectionClass(new Annotation\ResponseBody());
        $this->httpMethodRef = new ReflectionClass(new Annotation\HttpMethod());
        $this->privateKeyRef = new ReflectionClass(new Annotation\PrivateKey());
        $this->secureRef = new ReflectionClass(new Annotation\Secure());
        $this->routeRef = new ReflectionClass(new Annotation\Route());
        foreach ($classIterator as $refl) {
            $annotation = $reader->getClassAnnotation($refl, $this->controllerRef->getName());
            if (!empty($annotation)) {
                $this->loadClass($refl, $reader, $router);
            }
        }
    }

    public function loadClass(ReflectionClass $classRef, Reader $reader, Router $router) {
        $methods = $classRef->getMethods(ReflectionMethod::IS_PUBLIC);
        foreach ($methods as $method) {
            $this->loadClassMethod($classRef, $method, $reader, $router);
        }
    }

    public function loadClassMethod(ReflectionClass $classRef, ReflectionMethod $method, Reader $reader, Router $router) {
        $routes = $this->getMethodRoutes($reader, $method);
        if (count($routes) > 0) {
            /** @var Annotation\Audit $audit */
            $audit = $reader->getMethodAnnotation($method, $this->auditKeyRef->getName());
            /** @var Annotation\ResponseBody $responseBody */
            $responseBody = $reader->getMethodAnnotation($method, $this->responseBodyRef->getName());
            /** @var Annotation\HttpMethod $httpMethod */
            $httpMethod = $reader->getMethodAnnotation($method, $this->httpMethodRef->getName());
            /** @var Annotation\PrivateKey $privateKey */
            $privateKey = $reader->getMethodAnnotation($method, $this->privateKeyRef->getName());
            /** @var Annotation\Secure $secure */
            $secure = $reader->getMethodAnnotation($method, $this->secureRef->getName());
            foreach ($routes as $iValue) {
                $router->addRoute(new Route([
                    'path' => $iValue->path,
                    'class' => $classRef->name,
                    'classMethod' => $method->name,
                    'responseBody' => (bool)$responseBody,
                    'httpMethod' => $httpMethod->allow ?? null,
                    'privateKeys' => $privateKey->names ?? null,
                    'secure' => $secure->roles ?? null,
                    'audit' => (bool)$audit
                ]));
            }
        }
    }

    /**
     * @return Route[]
     */
    public function getMethodRoutes(Reader $reader, ReflectionMethod $method) {
        $routes = [];
        $annotations = $reader->getMethodAnnotations($method);
        foreach ($annotations as $iValue) {
            if ($this->routeRef->isInstance($iValue)) {
                $routes[] = $iValue;
            }
        }
        return $routes;
    }
}